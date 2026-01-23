import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot, query, where, orderBy, limit, getDocs, deleteDoc, Timestamp, setDoc, collectionData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Choice = 'rock' | 'paper' | 'scissors' | null;

export interface Tournament {
  id?: string;
  player1Id: string;
  player1Email: string;
  player1Nickname?: string;
  player2Id?: string | null;
  player2Email?: string | null;
  player2Nickname?: string | null;
  isVsComputer?: boolean;
  status: 'waiting' | 'in-progress' | 'completed';
  currentRound: number;
  player1Score: number;
  player2Score: number;
  rounds: Round[];
  createdAt: any;
  updatedAt: any;
  gameMode?: 'tournament' | 'casual';
}

export interface Round {
  roundNumber: number;
  player1Choice: Choice;
  player2Choice: Choice;
  winner: string | null;
  completed: boolean;
}

export interface Friend {
  id?: string;
  userId: string;
  friendId: string;
  friendEmail: string;
  friendNickname: string;
  addedAt: any;
}

export interface GameRequest {
  id: string;
  fromUserId: string;
  fromEmail: string;
  fromNickname: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
  tournamentId?: string;
}

export interface ChatMessage {
  id?: string;
  tournamentId: string;
  userId: string;
  userNickname: string;
  message: string;
  timestamp: any;
}

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createTournament(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const nickname = userSnap.exists() ? (userSnap.data() as any)['nickname'] : (user.email || '');

    const tournamentsCollection = collection(this.firestore, 'tournaments');
    const tournament: Omit<Tournament, 'id'> = {
      player1Id: user.uid,
      player1Email: user.email || '',
      player1Nickname: nickname,
      status: 'waiting',
      currentRound: 1,
      player1Score: 0,
      player2Score: 0,
      rounds: this.initializeRounds(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      gameMode: 'tournament'
    };

    const docRef = await addDoc(tournamentsCollection, tournament);
    return docRef.id;
  }

  async createComputerTournament(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const nickname = userSnap.exists() ? userSnap.data()['nickname'] : user.email;

    const tournamentsCollection = collection(this.firestore, 'tournaments');
    const tournament: Omit<Tournament, 'id'> = {
      player1Id: user.uid,
      player1Email: user.email || '',
      player1Nickname: nickname,
      player2Id: 'COMPUTER',
      player2Email: '🤖 Computer',
      player2Nickname: '🤖 Computer',
      isVsComputer: true,
      status: 'in-progress',
      currentRound: 1,
      player1Score: 0,
      player2Score: 0,
      rounds: this.initializeRounds(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      gameMode: 'tournament'
    };

    const docRef = await addDoc(tournamentsCollection, tournament);
    return docRef.id;
  }

  // Create casual game vs computer
  async createCasualComputerGame(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const nickname = userSnap.exists() ? userSnap.data()['nickname'] : user.email;

    const gamesCollection = collection(this.firestore, 'tournaments');
    const game: Omit<Tournament, 'id'> = {
      player1Id: user.uid,
      player1Email: user.email || '',
      player1Nickname: nickname,
      player2Id: 'COMPUTER',
      player2Email: '🤖 Computer',
      player2Nickname: '🤖 Computer',
      isVsComputer: true,
      gameMode: 'casual',
      status: 'in-progress',
      currentRound: 1,
      player1Score: 0,
      player2Score: 0,
      rounds: [{ roundNumber: 1, player1Choice: null, player2Choice: null, winner: null, completed: false }],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(gamesCollection, game);
    return docRef.id;
  }

  // Create casual multiplayer game
  async createCasualGame(): Promise<string> {
  const user = this.auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const userRef = doc(this.firestore, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const nickname = userSnap.exists() ? userSnap.data()['nickname'] : user.email;

  const gamesCollection = collection(this.firestore, 'tournaments');
  const game: Omit<Tournament, 'id'> = {
    player1Id: user.uid,
    player1Email: user.email || '',
    player1Nickname: nickname,
    player2Id: null,
    player2Email: null,
    player2Nickname: null,
    isVsComputer: false,
    gameMode: 'casual',
    status: 'waiting',
    currentRound: 1,
    player1Score: 0,
    player2Score: 0,
    rounds: [{ roundNumber: 1, player1Choice: null, player2Choice: null, winner: null, completed: false }],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(gamesCollection, game);
  return docRef.id;
}

  // Get user's in-progress casual games
  getInProgressCasualGames(userId: string): Observable<Tournament[]> {
    const q = query(
      collection(this.firestore, 'tournaments'),
      where('gameMode', '==', 'casual'),
      where('status', '==', 'in-progress'),
      orderBy('updatedAt', 'desc')
    );
    
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((games: any[]) => {
        // Filter to only games where the user is a participant
        return games.filter(game => 
          game.player1Id === userId || game.player2Id === userId
        ) as Tournament[];
      })
    ) as Observable<Tournament[]>;
  }

  async hasActiveGameWith(opponentId: string): Promise<string | null> {
  const user = this.auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(this.firestore, 'tournaments'),
    where('status', 'in', ['waiting', 'in-progress']),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const activeTournaments = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Tournament))
    .filter(t => 
      (t.player1Id === user.uid && t.player2Id === opponentId) ||
      (t.player2Id === user.uid && t.player1Id === opponentId)
    );

  return activeTournaments.length > 0 ? activeTournaments[0].id! : null;
}

  async joinTournament(tournamentId: string): Promise<void> {
  const user = this.auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const tournamentRef = doc(this.firestore, 'tournaments', tournamentId);
  const tournamentSnap = await getDoc(tournamentRef);
  
  if (!tournamentSnap.exists()) {
    throw new Error('Tournament not found');
  }

  const tournament = tournamentSnap.data() as Tournament;
  
  // Check if user already has an active game with this opponent
  const existingGameId = await this.hasActiveGameWith(tournament.player1Id);
  if (existingGameId && existingGameId !== tournamentId) {
    throw new Error('You already have an active game with this player');
  }

  const userRef = doc(this.firestore, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const nickname = userSnap.exists() ? (userSnap.data() as any)['nickname'] : (user.email || '');

  await updateDoc(tournamentRef, {
    player2Id: user.uid,
    player2Email: user.email || '',
    player2Nickname: nickname,
    status: 'in-progress',
    updatedAt: Timestamp.now()
  });
}

async searchUsers(searchQuery: string): Promise<Array<{uid: string, nickname: string}>> {
  const usersRef = collection(this.firestore, 'users');
  const q = query(
    usersRef,
    where('nickname', '>=', searchQuery),
    where('nickname', '<=', searchQuery + '\uf8ff'),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    nickname: doc.data()['nickname']
  }));
}

  async makeChoice(tournamentId: string, choice: Choice) {
    const tournamentRef = doc(this.firestore, 'tournaments', tournamentId);
    const tournamentSnap = await getDoc(tournamentRef);
    
    if (!tournamentSnap.exists()) {
      throw new Error('Tournament not found');
    }

    const tournament = tournamentSnap.data() as Tournament;
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const isPlayer1 = user.uid === tournament.player1Id;
    const currentRound = tournament.rounds[tournament.currentRound - 1];

    // Prevent changing choice if already made
    if (isPlayer1 && currentRound.player1Choice) {
      console.log('Player 1 already made choice');
      return;
    }
    if (!isPlayer1 && currentRound.player2Choice) {
      console.log('Player 2 already made choice');
      return;
    }

    if (isPlayer1) {
      currentRound.player1Choice = choice;
    } else {
      currentRound.player2Choice = choice;
    }

    // Computer opponent makes choice
    if (tournament.isVsComputer && isPlayer1 && !currentRound.player2Choice) {
      const choices: Choice[] = ['rock', 'paper', 'scissors'];
      currentRound.player2Choice = choices[Math.floor(Math.random() * choices.length)];
    }

    // Check if round is complete
    if (currentRound.player1Choice && currentRound.player2Choice) {
      const winner = this.determineWinner(currentRound.player1Choice, currentRound.player2Choice);
      currentRound.winner = winner === 'player1' ? tournament.player1Id : 
                           winner === 'player2' ? (tournament.player2Id || 'COMPUTER') : null;
      currentRound.completed = true;

      if (winner === 'player1') tournament.player1Score++;
      if (winner === 'player2') tournament.player2Score++;

      // Handle different game modes
      if (tournament.gameMode === 'casual') {
        // CASUAL MODE: Just add a new round, game never ends
        tournament.currentRound++;
        tournament.rounds.push({
          roundNumber: tournament.currentRound,
          player1Choice: null,
          player2Choice: null,
          winner: null,
          completed: false
        });
      } else {
        // TOURNAMENT MODE: Best of 5, then complete
        if (tournament.currentRound < 5) {
          tournament.currentRound++;
        } else {
          tournament.status = 'completed';
          await this.updatePlayerStats(tournament);
        }
      }
    }

    tournament.updatedAt = Timestamp.now();
    await updateDoc(tournamentRef, tournament as any);
  }

  private determineWinner(choice1: Choice, choice2: Choice): 'player1' | 'player2' | null {
    if (choice1 === choice2) return null;
    
    if (
      (choice1 === 'rock' && choice2 === 'scissors') ||
      (choice1 === 'paper' && choice2 === 'rock') ||
      (choice1 === 'scissors' && choice2 === 'paper')
    ) {
      return 'player1';
    }
    
    return 'player2';
  }

  private async updatePlayerStats(tournament: Tournament): Promise<void> {
    // Update player statistics after tournament completion
    // This can be expanded to track more detailed stats in the future
    return Promise.resolve();
  }

  private getComputerChoice(): Choice {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * 3)];
  }

  private determineRoundWinner(choice1: Choice, choice2: Choice, player1Id: string, player2Id: string): string | null {
    if (choice1 === choice2) return null;
    
    if (
      (choice1 === 'rock' && choice2 === 'scissors') ||
      (choice1 === 'paper' && choice2 === 'rock') ||
      (choice1 === 'scissors' && choice2 === 'paper')
    ) {
      return player1Id;
    }
    
    return player2Id;
  }

  private initializeRounds(): Round[] {
    return Array.from({ length: 5 }, (_, i) => ({
      roundNumber: i + 1,
      player1Choice: null,
      player2Choice: null,
      winner: null,
      completed: false
    }));
  }

  getTournament(tournamentId: string): Observable<Tournament | null> {
    return new Observable(observer => {
      const tournamentRef = doc(this.firestore, 'tournaments', tournamentId);
      const unsubscribe = onSnapshot(tournamentRef, (snapshot) => {
        if (snapshot.exists()) {
          observer.next({ id: snapshot.id, ...snapshot.data() } as Tournament);
        } else {
          observer.next(null);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  getAvailableTournaments(): Observable<Tournament[]> {
    return new Observable(observer => {
      const tournamentsCollection = collection(this.firestore, 'tournaments');
      const q = query(
        tournamentsCollection,
        where('status', '==', 'waiting'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tournaments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Tournament[];
        observer.next(tournaments);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    const tournamentRef = doc(this.firestore, 'tournaments', tournamentId);
    await deleteDoc(tournamentRef);
  }

  async getUserGameHistory(userId: string): Promise<Tournament[]> {
    const tournamentsCollection = collection(this.firestore, 'tournaments');
    const q = query(
      tournamentsCollection,
      where('status', '==', 'completed'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const allTournaments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
    
    return allTournaments
      .filter(t => t.player1Id === userId || t.player2Id === userId)
      .sort((a, b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis());
  }

  getUserStats(userId: string, tournaments: Tournament[]) {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalRoundsWon = 0;
    let totalRoundsLost = 0;

    tournaments.forEach(tournament => {
      const isPlayer1 = tournament.player1Id === userId;
      const playerScore = isPlayer1 ? tournament.player1Score : tournament.player2Score;
      const opponentScore = isPlayer1 ? tournament.player2Score : tournament.player1Score;

      if (playerScore > opponentScore) wins++;
      else if (playerScore < opponentScore) losses++;
      else draws++;

      totalRoundsWon += playerScore;
      totalRoundsLost += opponentScore;
    });

    return {
      totalGames: tournaments.length,
      wins,
      losses,
      draws,
      winRate: tournaments.length > 0 ? ((wins / tournaments.length) * 100).toFixed(1) : '0.0',
      totalRoundsWon,
      totalRoundsLost
    };
  }

  async getLeaderboardData(timeFilter: 'day' | 'week' | 'month' | 'year' | 'all'): Promise<any[]> {
    const tournamentsCollection = collection(this.firestore, 'tournaments');
    
    let cutoffDate = new Date();
    switch (timeFilter) {
      case 'day':
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      case 'all':
        cutoffDate = new Date(0);
        break;
    }

    const q = query(
      tournamentsCollection,
      where('status', '==', 'completed'),
      limit(500)
    );

    const querySnapshot = await getDocs(q);
    const tournaments = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Tournament));

    const filteredTournaments = tournaments.filter(t => 
      t.updatedAt && t.updatedAt.toDate() >= cutoffDate
    );

    const userStatsMap = new Map<string, {
      userId: string;
      email: string;
      wins: number;
      losses: number;
      draws: number;
      totalGames: number;
      roundsWon: number;
      roundsLost: number;
      winRate: number;
    }>();

    filteredTournaments.forEach(tournament => {
      if (tournament.player1Id && !tournament.isVsComputer) {
        const stats = userStatsMap.get(tournament.player1Id) || {
          userId: tournament.player1Id,
          email: tournament.player1Email,
          wins: 0,
          losses: 0,
          draws: 0,
          totalGames: 0,
          roundsWon: 0,
          roundsLost: 0,
          winRate: 0
        };

        stats.totalGames++;
        stats.roundsWon += tournament.player1Score;
        stats.roundsLost += tournament.player2Score;

        if (tournament.player1Score > tournament.player2Score) stats.wins++;
        else if (tournament.player1Score < tournament.player2Score) stats.losses++;
        else stats.draws++;

        stats.winRate = (stats.wins / stats.totalGames) * 100;
        userStatsMap.set(tournament.player1Id, stats);
      }

      if (tournament.player2Id && tournament.player2Id !== 'COMPUTER') {
        const stats = userStatsMap.get(tournament.player2Id) || {
          userId: tournament.player2Id,
          email: tournament.player2Email || 'Unknown',
          wins: 0,
          losses: 0,
          draws: 0,
          totalGames: 0,
          roundsWon: 0,
          roundsLost: 0,
          winRate: 0
        };

        stats.totalGames++;
        stats.roundsWon += tournament.player2Score;
        stats.roundsLost += tournament.player1Score;

        if (tournament.player2Score > tournament.player1Score) stats.wins++;
        else if (tournament.player2Score < tournament.player1Score) stats.losses++;
        else stats.draws++;

        stats.winRate = (stats.wins / stats.totalGames) * 100;
        userStatsMap.set(tournament.player2Id, stats);
      }
    });

    return Array.from(userStatsMap.values())
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winRate - a.winRate;
      })
      .slice(0, 10);
  }

  // Friends functionality
  async addFriend(userId: string, friendId: string, friendNickname: string): Promise<void> {
    const existingFriend = await this.getFriend(userId, friendId);
    if (existingFriend) {
      throw new Error('Already friends');
    }

    const friendsCollection = collection(this.firestore, 'friends');
    await addDoc(friendsCollection, {
      userId: userId,
      friendId: friendId,
      friendEmail: '', // Not needed for search-based friends
      friendNickname: friendNickname,
      addedAt: Timestamp.now()
    });
  }

  async removeFriend(friendId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const friendsCollection = collection(this.firestore, 'friends');
    const q = query(
      friendsCollection,
      where('userId', '==', user.uid),
      where('friendId', '==', friendId)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  }

  async getFriends(userId: string): Promise<Friend[]> {
    const friendsCollection = collection(this.firestore, 'friends');
    const q = query(
      friendsCollection,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Friend));
  }

  private async getFriend(userId: string, friendId: string): Promise<Friend | null> {
    const friendsCollection = collection(this.firestore, 'friends');
    const q = query(
      friendsCollection,
      where('userId', '==', userId),
      where('friendId', '==', friendId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    } as Friend;
  }

  async isFriend(friendId: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;
    const friend = await this.getFriend(user.uid, friendId);
    return friend !== null;
  }

  // Game Request functionality
  async sendGameRequest(toUserId: string, toEmail: string, toNickname: string): Promise<void> {
    const fromUserId = this.auth.currentUser?.uid;
    if (!fromUserId) throw new Error('Not authenticated');

    const fromEmail = this.auth.currentUser?.email || '';
    const fromNickname = await this.getUserNickname(fromUserId);

    const requestRef = doc(collection(this.firestore, 'gameRequests'));
    await setDoc(requestRef, {
      id: requestRef.id,
      fromUserId,
      fromEmail,
      fromNickname: fromNickname || fromEmail,
      toUserId,
      status: 'pending',
      createdAt: Timestamp.now()
    });
  }

  getGameRequests(userId: string): Observable<GameRequest[]> {
    const q = query(
      collection(this.firestore, 'gameRequests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<GameRequest[]>;
  }

  getSentGameRequests(userId: string): Observable<GameRequest[]> {
    const q = query(
      collection(this.firestore, 'gameRequests'),
      where('fromUserId', '==', userId),
      where('status', 'in', ['pending', 'accepted']),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<GameRequest[]>;
  }

  async acceptGameRequest(requestId: string): Promise<string> {
    const requestRef = doc(this.firestore, 'gameRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) throw new Error('Request not found');
    
    const request = requestSnap.data() as GameRequest;
    
    const tournamentId = await this.createTournamentForRequest(
      request.fromUserId,
      request.fromEmail,
      request.fromNickname,
      request.toUserId
    );
    
    await updateDoc(requestRef, {
      status: 'accepted',
      tournamentId
    });
    
    return tournamentId;
  }

  async declineGameRequest(requestId: string): Promise<void> {
    const requestRef = doc(this.firestore, 'gameRequests', requestId);
    await updateDoc(requestRef, {
      status: 'declined'
    });
  }

  private async createTournamentForRequest(
    player1Id: string,
    player1Email: string,
    player1Nickname: string,
    player2Id: string
  ): Promise<string> {
    const player2Email = this.auth.currentUser?.email || '';
    const player2Nickname = await this.getUserNickname(player2Id);
    
    const tournamentRef = doc(collection(this.firestore, 'tournaments'));
    const newTournament: Tournament = {
      id: tournamentRef.id,
      player1Id,
      player1Email,
      player1Nickname: player1Nickname || player1Email,
      player2Id,
      player2Email,
      player2Nickname: player2Nickname || player2Email,
      player1Score: 0,
      player2Score: 0,
      currentRound: 1,
      status: 'in-progress',
      rounds: this.initializeRounds(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isVsComputer: false,
      gameMode: 'tournament'
    };
    
    await setDoc(tournamentRef, newTournament);
    return tournamentRef.id;
  }

  private async getUserNickname(userId: string): Promise<string> {
    const userRef = doc(this.firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as any)['nickname'] || '' : '';
  }

  // Chat functionality
  getChatMessages(tournamentId: string): Observable<ChatMessage[]> {
    const q = query(
      collection(this.firestore, 'chatMessages'),
      where('tournamentId', '==', tournamentId),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<ChatMessage[]>;
  }

  async sendChatMessage(tournamentId: string, message: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const userNickname = await this.getUserNickname(user.uid);

    const messagesCollection = collection(this.firestore, 'chatMessages');
    await addDoc(messagesCollection, {
      tournamentId,
      userId: user.uid,
      userNickname: userNickname || user.email || 'Player',
      message: message.trim(),
      timestamp: Timestamp.now()
    });
  }

  async clearChatMessages(tournamentId: string): Promise<void> {
    const q = query(
      collection(this.firestore, 'chatMessages'),
      where('tournamentId', '==', tournamentId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
}