import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MetamaskService } from './services/metamask.service';
import { OpenSeaService } from './services/open-sea.service';
import { ContractService } from './services/contract.service';
import { PlayersService } from './services/players.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { DropsModule } from './drops/drops.module';
import { BattlesModule } from './battles/battles.module';
import { AppComponent } from './app.component';

const ROUTES: Routes = [{ path: '', pathMatch: 'full', redirectTo: 'drops' }];

@NgModule({
  declarations: [AppComponent, NavbarComponent, FooterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES, { scrollPositionRestoration: 'enabled' }),
    ToastModule,
    ProgressSpinnerModule,
    DropsModule,
    BattlesModule,
  ],
  providers: [
    MetamaskService,
    OpenSeaService,
    ContractService,
    PlayersService,
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
